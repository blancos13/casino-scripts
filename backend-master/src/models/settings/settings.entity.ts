import { Column, Entity, PrimaryColumn, OneToOne, JoinColumn } from 'typeorm';

import { Attachment } from '../attachment/attachment.entity';

import { ICreateSetting } from './intefaces/create-setting.interface';

@Entity({
  name: 'settings',
})
export class Settings {
  @PrimaryColumn()
  public key: string;

  @Column({ nullable: true, type: 'text' })
  public value: string;

  @Column({ nullable: true, type: 'text' })
  public name: string;

  @OneToOne(() => Attachment, { nullable: true, eager: true })
  @JoinColumn({ name: 'file_id' })
  public fid: string;

  constructor(data: ICreateSetting) {
    if (data) {
      this.key = data.key;

      if (data.value) {
        this.value = data.value;
      }

      if (data.fid) {
        this.fid = data.fid;
      }

      if (data.name) {
        this.name = data.name;
      }
    }
  }
}
