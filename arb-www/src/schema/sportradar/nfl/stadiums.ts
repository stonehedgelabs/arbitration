import { BaseDTO } from '../../BaseDTO';

export class NFLStadium extends BaseDTO {
  StadiumID!: number;
  Name!: string;
  City!: string;
  State?: string;
  Country!: string;
  Capacity?: number;
  PlayingSurface?: string;
  GeoLat!: number;
  GeoLong!: number;
  Type?: string;
}

export class NFLStadiumsResponse extends BaseDTO {
  data!: NFLStadium[];
  league!: string;
}
