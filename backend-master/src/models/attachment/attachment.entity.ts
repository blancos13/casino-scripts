import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity({
  name: 'attachment',
})
export class Attachment {
  @PrimaryGeneratedColumn()
  public id: string;

  @Column({ nullable: false, type: 'text' })
  public file: string;

  constructor(file: string) {
    if (file) {
      this.file = file;
    }
  }
}
