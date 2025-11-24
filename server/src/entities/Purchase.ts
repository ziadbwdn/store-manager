import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
  JoinColumn,
} from 'typeorm';
import { Customer } from './Customer';
import { PurchaseItem } from './PurchaseItem';
import { PurchaseCancellation } from './PurchaseCancellation';

export enum PurchaseStatus {
  PENDING = 'pending',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
}

@Entity('purchases')
export class Purchase {
  @PrimaryGeneratedColumn()
  id: number;

  @Column('decimal', { precision: 10, scale: 2 })
  totalAmount: number;

  @Column({
    type: 'enum',
    enum: PurchaseStatus,
    default: PurchaseStatus.PENDING,
  })
  status: PurchaseStatus;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => Customer, (customer) => customer.purchases, {
    onDelete: 'RESTRICT',
    eager: true,
  })
  @JoinColumn({ name: 'customer_id' })
  customer: Customer;

  @OneToMany(() => PurchaseItem, (item) => item.purchase, { cascade: true, eager: true })
  items: PurchaseItem[];

  @OneToMany(() => PurchaseCancellation, (cancellation) => cancellation.purchase)
  cancellationRecord: PurchaseCancellation[];
}
