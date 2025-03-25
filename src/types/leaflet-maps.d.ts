
declare module 'leaflet' {
  export interface LatLng {
    lat: number;
    lng: number;
  }
  
  export interface Map {
    setView(center: [number, number], zoom: number): this;
    on(type: string, fn: Function): this;
    remove(): void;
  }

  export interface MapOptions {
    center?: LatLng;
    zoom?: number;
  }

  export interface Marker {
    setLatLng(latlng: LatLng): this;
    getLatLng(): LatLng;
    on(type: string, fn: Function): this;
  }

  export interface TileLayerOptions {
    attribution?: string;
    maxZoom?: number;
  }

  export function map(element: HTMLElement, options?: MapOptions): Map;
  export function tileLayer(urlTemplate: string, options?: TileLayerOptions): any;
  export function marker(latlng: LatLng, options?: any): Marker;
  export function latLng(lat: number, lng: number): LatLng;

  export namespace Icon {
    export class Default {
      constructor();
      static mergeOptions(options: any): void;
    }
  }
}

export {};
