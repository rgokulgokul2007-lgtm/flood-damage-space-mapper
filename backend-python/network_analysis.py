"""
Network Analysis Engine for Disaster Road Networks & Cut-Off Settlements
Uses NetworkX to identify severed transport corridors and isolated human settlements.
"""

import math
from typing import Dict, Any, List, Set, Tuple
import networkx as nx
from shapely.geometry import shape, Point, LineString, Polygon, MultiPolygon
from shapely.ops import unary_union

class DisasterNetworkAnalyzer:
    """
    Overlays satellite-derived flood & debris segmentation masks onto OpenStreetMap
    road graphs to identify cut-off settlements and damaged infrastructure.
    """
    def __init__(self):
        self.graph = nx.Graph()
        self.settlement_nodes = set()
        self.arterial_hubs = set()

    def build_osm_graph(self, osm_elements: List[Dict[str, Any]]) -> nx.Graph:
        """
        Builds a NetworkX graph from OpenStreetMap nodes and ways.
        """
        self.graph.clear()
        self.settlement_nodes.clear()
        self.arterial_hubs.clear()

        # 1. Index nodes
        node_coords = {}
        for el in osm_elements:
            if el.get("type") == "node":
                nid = el.get("id")
                lat = el.get("lat")
                lon = el.get("lon")
                node_coords[nid] = (lon, lat)
                
                tags = el.get("tags", {})
                place_type = tags.get("place")
                if place_type in ["village", "town", "hamlet", "isolated_dwelling", "suburb"]:
                    name = tags.get("name:en") or tags.get("name") or f"Settlement-{nid}"
                    nepali_name = tags.get("name:ne") or tags.get("name") or name
                    pop = int(tags.get("population", 0)) or tags.get("estimate_population", 350)
                    self.graph.add_node(
                        nid, 
                        pos=(lon, lat), 
                        type="settlement", 
                        name=name,
                        nepali_name=nepali_name,
                        population=pop
                    )
                    self.settlement_nodes.add(nid)

        # 2. Add edges from ways
        for el in osm_elements:
            if el.get("type") == "way":
                tags = el.get("tags", {})
                highway = tags.get("highway")
                if highway:
                    way_nodes = el.get("nodes", [])
                    is_bridge = tags.get("bridge") in ["yes", "viaduct", "suspension"]
                    road_name = tags.get("name:en") or tags.get("name") or highway
                    
                    # Mark major trunk / primary roads as arterial hubs
                    if highway in ["motorway", "trunk", "primary"]:
                        for nid in way_nodes:
                            self.arterial_hubs.add(nid)

                    for i in range(len(way_nodes) - 1):
                        u = way_nodes[i]
                        v = way_nodes[i + 1]
                        if u in node_coords and v in node_coords:
                            p1 = node_coords[u]
                            p2 = node_coords[v]
                            # Calculate distance in km
                            dx = (p2[0] - p1[0]) * 111.32 * math.cos(math.radians(p1[1]))
                            dy = (p2[1] - p1[1]) * 110.57
                            dist_km = math.sqrt(dx * dx + dy * dy)
                            
                            line_geom = LineString([p1, p2])
                            
                            self.graph.add_edge(
                                u, v,
                                weight=dist_km,
                                distance_km=dist_km,
                                highway=highway,
                                is_bridge=is_bridge,
                                name=road_name,
                                geometry=line_geom,
                                status="intact"
                            )

        # Ensure at least one arterial hub exists for fallback
        if not self.arterial_hubs and self.graph.nodes():
            first_node = list(self.graph.nodes())[0]
            self.arterial_hubs.add(first_node)

        return self.graph

    def evaluate_flood_impact(self, 
                              flood_polygons: List[Dict[str, Any]], 
                              debris_polygons: List[Dict[str, Any]]) -> Dict[str, Any]:
        """
        Intersects road edges and bridges with flood and debris polygons,
        marking severed transport links and computing isolated components.
        """
        # Unify flood and debris hazard zones
        hazard_geoms = []
        for poly in flood_polygons:
            try:
                hazard_geoms.append(shape(poly))
            except Exception:
                pass
        for poly in debris_polygons:
            try:
                hazard_geoms.append(shape(poly))
            except Exception:
                pass

        if not hazard_geoms:
            hazard_union = Polygon()
        else:
            hazard_union = unary_union(hazard_geoms)

        severed_edges = []
        intact_edges = []
        severed_bridges_count = 0
        damaged_km = 0.0
        total_road_km = 0.0

        # Create active graph copy to test reachability
        intact_graph = self.graph.copy()

        for u, v, data in self.graph.edges(data=True):
            dist = data.get("distance_km", 0.0)
            total_road_km += dist
            edge_geom = data.get("geometry")
            
            is_severed = False
            cause = None
            if edge_geom and not hazard_union.is_empty:
                if edge_geom.intersects(hazard_union):
                    is_severed = True
                    cause = "bridge_washout" if data.get("is_bridge") else "flood_inundation"

            if is_severed:
                data["status"] = "severed"
                data["cause"] = cause
                severed_edges.append({
                    "u": u,
                    "v": v,
                    "distance_km": round(dist, 3),
                    "name": data.get("name"),
                    "highway": data.get("highway"),
                    "cause": cause,
                    "is_bridge": data.get("is_bridge")
                })
                damaged_km += dist
                if data.get("is_bridge"):
                    severed_bridges_count += 1
                intact_graph.remove_edge(u, v)
            else:
                intact_edges.append((u, v))

        # Check connectivity of each settlement to nearest arterial hub
        isolated_settlements = []
        safe_settlements = []
        trapped_population = 0

        for s_node in self.settlement_nodes:
            if s_node not in intact_graph:
                continue
                
            has_path_to_hub = False
            for hub in self.arterial_hubs:
                if hub in intact_graph and nx.has_path(intact_graph, s_node, hub):
                    has_path_to_hub = True
                    break

            node_data = self.graph.nodes[s_node]
            coords = node_data.get("pos", (0, 0))
            pop = node_data.get("population", 0)

            if not has_path_to_hub:
                trapped_population += pop
                isolated_settlements.append({
                    "id": s_node,
                    "name": node_data.get("name", "Unknown Village"),
                    "nepali_name": node_data.get("nepali_name", "अज्ञात बस्ती"),
                    "coordinates": {"longitude": coords[0], "latitude": coords[1]},
                    "population": pop,
                    "status": "isolated",
                    "reason": "All arterial road segments severed by floodwaters/mudflow"
                })
            else:
                safe_settlements.append({
                    "id": s_node,
                    "name": node_data.get("name"),
                    "population": pop,
                    "status": "connected"
                })

        return {
            "total_road_network_km": round(total_road_km, 2),
            "damaged_road_km": round(damaged_km, 2),
            "severed_road_segments_count": len(severed_edges),
            "severed_bridges_count": severed_bridges_count,
            "total_settlements_analyzed": len(self.settlement_nodes),
            "isolated_settlements_count": len(isolated_settlements),
            "trapped_population_estimate": trapped_population,
            "isolated_settlements": isolated_settlements,
            "severed_edges_sample": severed_edges[:20]
        }
