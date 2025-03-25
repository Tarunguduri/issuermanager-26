
declare global {
  interface Window {
    google: {
      maps: {
        Map: any;
        Marker: any;
        Geocoder: any;
        event: any;
        MapTypeId: {
          ROADMAP: string;
        };
        Animation: {
          DROP: number;
        };
      };
    };
  }
}

export {};
