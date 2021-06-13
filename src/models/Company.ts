import { Entity, PrimaryGeneratedColumn, Column } from "typeorm";

@Entity()
export class Company {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column("varchar", { length: 200 })
  name!: string;

  @Column("char", { length: 9 })
  siren!: string;

  @Column("varchar", { length: 250 })
  address!: string;

  @Column("varchar", { length: 10 })
  postal_code!: string;

  @Column("varchar", { length: 50 })
  phone_number!: string;
}
