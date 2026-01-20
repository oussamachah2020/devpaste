import { type RouteConfig, index, layout, route } from "@react-router/dev/routes";

export default [
  layout("layout.tsx", [
    index("routes/home.tsx"),
    route("paste/:id", "routes/view-paste.tsx"),
    route("recent", "routes/recent-paste.tsx"),
    route("compare", "routes/compare-pastes.tsx"),
  ]),
] satisfies RouteConfig;
