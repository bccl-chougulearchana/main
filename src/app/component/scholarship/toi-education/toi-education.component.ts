import { Component} from '@angular/core';
import { RouterModule } from '@angular/router'; 

@Component({
  selector: 'app-toi-education',
  standalone: true,
  imports: [ RouterModule],
  templateUrl: './toi-education.component.html',
  styleUrl: './toi-education.component.scss'
})
export class ToiEducationComponent{
  constructor() { }
}

