import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-footer',
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.css'],
})
export class FooterComponent implements OnInit {
  info!: { header: string; content: string[] };
  forPatients!: { header: string; content: string[] };
  contact!: { header: string; content: string[] };
  social!: { header: string; content: string[] };
  dataTable!: { header: string; content: string[] }[];

  ngOnInit() {
    this.info = {
      header: 'ინფორმაცია',
      content: [
        'ჩვენ შესახებ',
        'პარტნიორები',
        'ექიმებისთვის',
        'კლინიკებისთვის',
        'აფთიაქებისთვის',
      ],
    };
    this.forPatients = {
      header: 'პაციენტებისთვის',
      content: ['ექიმები', 'კლინიკები', 'ანოტაციები', 'ბლოგი', 'მედია'],
    };
    this.contact = {
      header: 'კონტაქტი',
      content: [
        'სამუშაო დღეები :\nორშ-პარ',
        'სამუშაო დრო :\n9:00 - 17:00',
        'იაკობ ნიკოლაძე №10',
        '032 2 100 100',
      ],
    };
    this.social = {
      header: 'გამოგვყევით',
      content: ['Facebook', 'Instagram', 'Youtube', '&nbsp;', '&nbsp;'],
    };
    this.dataTable = [this.info, this.forPatients, this.contact, this.social];
  }

  getLongestContentLength() {
    return new Array(
      Math.max(...this.dataTable.map((table) => table.content.length))
    );
  }
}
