/* eslint-disable */
import * as Router from 'expo-router';

export * from 'expo-router';

declare module 'expo-router' {
  export namespace ExpoRouter {
    export interface __routes<T extends string = string> extends Record<string, unknown> {
      StaticRoutes: `/` | `/(tabs)` | `/(tabs)/AddScreen` | `/(tabs)/InventoryScreen` | `/(tabs)/MapScreen` | `/(tabs)/StatsScreen` | `/(tabs)/home` | `/AddScreen` | `/InventoryScreen` | `/MapScreen` | `/StatsScreen` | `/_sitemap` | `/dailyReport` | `/home` | `/notify` | `/notify/` | `/notify/notifications` | `/recipes` | `/scanner` | `/scanner/Overlay`;
      DynamicRoutes: never;
      DynamicRouteTemplate: never;
    }
  }
}
