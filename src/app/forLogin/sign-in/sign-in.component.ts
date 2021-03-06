import { Component, OnInit } from '@angular/core';
import { FormGroup, Validators, FormBuilder } from '@angular/forms';
import { UserManagementService } from '../../services/httpRequest/user-management.service';

@Component({
  selector: 'app-sign-in',
  templateUrl: './sign-in.component.html',
  styleUrls: ['./sign-in.component.css']
})
export class SignInComponent implements OnInit {

  hide: boolean = true;
  errorhide: boolean = true;
  signinForm: FormGroup;


  constructor(
    private fb: FormBuilder,
    private umService: UserManagementService) {
    this.signinForm = this.fb.group({
      email: ['', [Validators.required, Validators.pattern("^[_a-zA-Z0-9-\\.]+@[\\.a-zA-Z0-9-]+\\.[a-zA-Z]+$")]],
      password: ['', Validators.required]
    })
  }

  ngOnInit() {
  }

  getPasswordErrorMessage() {
    return 'The field is required'
  }
  getEmailErrorMessage() {
    return this.signinForm.get('email').hasError('required') ? 'The field is required' :
      this.signinForm.get('email').hasError('pattern') ? 'Not a valid email' :
        '';
  }

  onSubmit() {
    this.errorhide = false;

    if (this.signinForm.invalid) console.log('Input again');
    else {
      var payload: any = {
        userID: this.signinForm.value.email,
        password: this.signinForm.value.password,
      }

      /** HTTP REQUEST */
      var success: boolean = this.umService.SGI(payload);
      if (!success) {
        alert('Failed');
      }
    }
  }
}
