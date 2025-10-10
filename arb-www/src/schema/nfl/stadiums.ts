import { BaseDTO } from '../BaseDTO';

export class NFLStadium extends BaseDTO {
  StadiumID: number = 0;
  Name: string = '';
  City: string = '';
  State: string = '';
  Country: string = '';
  Capacity: number = 0;
  PlayingSurface: string = '';
  GeoLat: number = 0;
  GeoLong: number = 0;
  Type: string = '';
}

export class NFLStadiumsResponse extends BaseDTO {
  data: NFLStadium[] = [];
  league: string = '';
}
