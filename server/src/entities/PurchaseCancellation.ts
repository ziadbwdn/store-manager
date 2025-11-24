import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  JoinColumn,
} from 'typeorm';
import { Purchase } from './Purchase';
import { Customer } from './Customer';

@Entity('purchase_cancellations')
export class PurchaseCancellation {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'text', nullable: true })
  reason: string;

  @CreateDateColumn()
  cancelledAt: Date;

  @ManyToOne(() => Purchase, (purchase) => purchase.cancellationRecord, {
    onDelete: 'CASCADE',
    eager: true,
  })
  @JoinColumn({ name: 'purchase_id' })
  purchase: Purchase;

  @ManyToOne(() => Customer, (customer) => customer.cancellations, {
    onDelete: 'RESTRICT',
    eager: true,
  })
  @JoinColumn({ name: 'customer_id' })
  customer: Customer;
}
