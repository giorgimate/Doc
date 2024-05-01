import { Component, EventEmitter, Output } from '@angular/core';

@Component({
  selector: 'app-admin-header',
  templateUrl: './admin-header.component.html',
  styleUrls: ['./admin-header.component.css'],
})
export class AdminHeaderComponent {
  items: { label: string; query: string; active: boolean }[] = [
    { label: 'ექიმები', query: 'Doctor', active: false },
    { label: 'მომხმარებლები', query: 'Patient', active: false },
    { label: 'ადმინისტრატორები', query: 'Admin', active: false },
    { label: 'კატეგორიები', query: 'Category', active: false },
  ];
  @Output() itemChanged = new EventEmitter<{
    label: string;
    query: string;
    active: boolean;
  }>();

  ngOnInit() {
    this.items[0].active = true;
    this.itemChanged.emit(this.items[0]);
  }

  onActiveItemChange(item: { label: string; query: string; active: boolean }) {
    this.items.forEach((item) => (item.active = false));
    item.active = true;
    this.itemChanged.emit(item);
  }
}
