
export interface LocationCoordinates {
  lat: number;
  lng: number;
}

export interface LocationData extends LocationCoordinates {
  address: string;
}

export interface MapErrorState {
  hasError: boolean;
  message: string | null;
}
