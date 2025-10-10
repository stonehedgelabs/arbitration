import { BaseDTO } from '../BaseDTO';

export class NBAStadium extends BaseDTO {
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

export class NBAStadiumsResponse extends BaseDTO {
  data!: NBAStadium[];
  league!: string;
}
