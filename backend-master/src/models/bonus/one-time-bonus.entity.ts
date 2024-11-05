import { Entity, PrimaryGeneratedColumn, OneToMany, JoinColumn, Column } from "typeorm";

import { User } from '../user/user.entity'

@Entity({
    name: 'bonus_one_time'
})
export class BonusOneTime {
    @PrimaryGeneratedColumn()
    public id: string;

    @Column({ nullable: false, unique: true })
    public name: string;

    @Column({ nullable: true })
    public gainDiamond: number;

    @Column({ nullable: true })
    public gain: number;

    @Column({ nullable: true })
    public date: Date;

    @Column({ nullable: true })
    public countActivation: number;

    @Column({ nullable: false, default: false })
    public indefinitely: boolean

    @OneToMany(() => User, user => user.id)
    @JoinColumn({ name: 'user_id' })
    public user: string;

    constructor(data: any) {
        if (data) {
            this.name = data.name
            this.gainDiamond = data.gainDiamond
            this.gain = data.gain
            this.date = data.date
            this.countActivation = data.countActivation
            this.indefinitely = data.indefinitely || false
        }
    }
}