import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { UserManagementService } from 'src/app/services/httpRequest/user-management.service';
import { DataManagementService } from '../../services/data-management.service';

@Component({
  selector: 'app-sign-up',
  templateUrl: './sign-up.component.html',
  styleUrls: ['./sign-up.component.css']
})
export class SignUpComponent implements OnInit {
  hide: boolean = true;
  signupForm: FormGroup;
  genderOptions: any = ['Female', 'Male', 'Other'];


  constructor(
    private fb: FormBuilder,
    private umService: UserManagementService,
    private dataService: DataManagementService) {
    this.signupForm = this.fb.group({
      firstname: ['', Validators.required],
      lastname: ['', Validators.required],
      email: ['', [Validators.required, Validators.pattern("^[_a-zA-Z0-9-\\.]+@[\\.a-zA-Z0-9-]+\\.[a-zA-Z]+$")]],
      password: ['', [Validators.required, Validators.pattern("^[a-zA-Z0-9!@.#$%^&*?_~]{6,16}$")]],
      birthdate: ['', Validators.required],
      gender: ['', [Validators.required]]
    });
  }

  ngOnInit() {
  }


  /** Form Error MSGs */
  getRequiredErrorMessage() {
    return 'The field is required';
  }
  getBirthdateErrorMessage() {
    return 'Please choose your birth date';
  }
  getPasswordErrorMessage() {
    return this.signupForm.get('password').hasError('required') ? 'The field is required' :
      this.signupForm.get('password').hasError('pattern') ? 'Password must contain at least one special character' : '';
  }
  getEmailErrorMessage() {
    return this.signupForm.get('email').hasError('required') ? 'The field is required' :
      this.signupForm.get('email').hasError('pattern') ? 'Not a valid email' :
        '';
  }


  /** Event functions */
  onSubmit() {
    if (this.signupForm.invalid) console.log('Input again');

    var payload: any = {
      birth: this.dataService.formattingDate(this.signupForm.value['birthdate']),
      gender: this.signupForm.value['gender'],
      userID: this.signupForm.value['email'],
      password: this.signupForm.value['password'],
      firstname: this.signupForm.value['firstname'],
      lastname: this.signupForm.value['lastname'],
    }
    console.log(payload);

    /** HTTP REQUEST */
    var success: boolean = this.umService.SGU(payload);

    if (!success) {;
      alert('Header error'); //showing error window is better than alert I guess.
    }

  }


}
