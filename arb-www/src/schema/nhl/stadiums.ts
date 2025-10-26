import { BaseDTO } from '../BaseDTO';

export class NHLStadium extends BaseDTO {
  StadiumID!: number;
  Active!: boolean;
  Name!: string;
  Address!: string;
  City!: string;
  State!: string;
  Zip!: string;
  Country!: string;
  Capacity!: number;
  GeoLat!: number;
  GeoLong!: number;
}

export class NHLStadiumsResponse extends BaseDTO {
  data!: NHLStadium[];
  league!: string;
}
