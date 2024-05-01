import { Component, ViewChild } from '@angular/core';
import { AdminTableComponent } from './admin-table/admin-table.component';
import { query } from '@angular/animations';
import { AdminHeaderComponent } from './admin-header/admin-header.component';

@Component({
  selector: 'app-admin',
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.css'],
})
export class AdminComponent {
  @ViewChild(AdminTableComponent) adminTable!: AdminTableComponent;
  @ViewChild(AdminHeaderComponent) adminHeader!: AdminHeaderComponent;

  ngAfterViewInit() {
    const initialItem = this.adminHeader.items.find((item) => item.active);
    if (initialItem) {
      this.adminTable.loadTable(initialItem.query);
    }
  }

  onItemChanged(item: { label: string; query: string; active: boolean }) {
    this.adminTable.loadTable(item.query);
    this.checkIfDoctor(item.query);
  }

  checkIfDoctor(query: string) {
    if (query === 'Doctor') {
      this.adminTable.isDoctor = true;
    } else this.adminTable.isDoctor = false;
  }
}
