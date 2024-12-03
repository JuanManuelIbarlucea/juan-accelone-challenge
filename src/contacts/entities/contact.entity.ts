import { Column, Table, Model, IsEmail, Unique } from 'sequelize-typescript';

@Table({
  tableName: 'contact',
})
export class Contact extends Model {
  @Column
  name: string;

  @Unique
  @Column
  number: string;

  @Unique
  @IsEmail
  @Column
  email: string;

  @Column
  notes: string;
}
