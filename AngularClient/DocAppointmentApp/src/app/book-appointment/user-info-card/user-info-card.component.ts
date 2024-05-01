import { Component, Input } from '@angular/core';
import { UserDto } from 'src/app/_interfaces/user/userDto';

@Component({
  selector: 'app-user-info-card',
  templateUrl: './user-info-card.component.html',
  styleUrls: ['./user-info-card.component.css']
})
export class UserInfoCardComponent {
  @Input() user!: UserDto;

}
