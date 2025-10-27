import { BaseDTO } from '../../BaseDTO';

export class Stadium extends BaseDTO {
  StadiumID!: number;
  Active!: boolean;
  Name!: string;
  City?: string;
  State?: string;
  Country?: string;
  Capacity?: number;
  Surface?: string;
  LeftField?: number;
  MidLeftField?: number;
  LeftCenterField?: number;
  MidLeftCenterField?: number;
  CenterField?: number;
  MidRightCenterField?: number;
  RightCenterField?: number;
  MidRightField?: number;
  RightField?: number;
  GeoLat?: number;
  GeoLong?: number;
  Altitude?: number;
  HomePlateDirection?: number;
  Type?: string;
}

export class StadiumsResponse extends BaseDTO {
  data!: Stadium[];
  league!: string;
}
