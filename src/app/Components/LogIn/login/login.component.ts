import { Component, ElementRef, OnInit, Renderer2, ViewChild } from '@angular/core';
import { LoginService } from '../../../Services/LogIn/login.service';
import { Signup } from '../../../Models/signup';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ToastrService } from 'ngx-toastr';
import { LoginModule } from '../../../Modules/login/login.module';
import { Router } from '@angular/router';


@Component({
  selector: 'app-login',
  standalone: true,
  imports: [LoginModule, FormsModule, ReactiveFormsModule, CommonModule
  ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent implements OnInit {
  user: Signup = new Signup();
  userForm!: FormGroup;
  loginForm!: FormGroup;
  forgotPasswordForm!: FormGroup;
  forgotPasswordMode = false;

  @ViewChild('pinkbox', { static: false }) pinkbox!: ElementRef;
  @ViewChild('signin', { static: false }) signinForm!: ElementRef;
  @ViewChild('signup', { static: false }) signupForm!: ElementRef;

  constructor(
    private fb: FormBuilder,
    private signupService: LoginService,
    private toastr: ToastrService,
    private renderer: Renderer2,
    private router: Router, 
  ) { }

  ngOnInit(): void {
    this.InitializeForms();
  }

  InitializeForms() {
    this.userForm = this.fb.group(
      {
        UserName: ['', [Validators.required, Validators.pattern('^[a-zA-Z0-9 ]*$')]],
        EmailAddress: ['', [Validators.required, Validators.email]],
        PhoneNumber: ['', [Validators.required, Validators.pattern('^[0-9]{10}$')]],
        Password: ['', [Validators.required, this.passwordValidator()]],
        ConfirmPassword: ['', Validators.required]
      },
      { validators: this.passwordMatchValidator }
    );

    this.loginForm = this.fb.group({
      username: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, this.passwordValidator()]],
      remember: [false]
    });

    this.forgotPasswordForm = this.fb.group(
      {
        email: ['', [Validators.required, Validators.email]],
        newPassword: ['', [Validators.required, this.passwordValidator()]],
        confirmPassword: ['', Validators.required]
      },
      { validators: this.passwordMatchValidator }
    );
  }

  async Login() {
    if (this.loginForm.invalid) {
      alert('Please fill in all required fields.');
      //this.toastr.error('Please fill in all required fields.');
      return;
    }

    try {
      const { username, password } = this.loginForm.value;
      const users = await this.signupService.getUsers().toPromise();

      if (users) {
        const user = users.find(u => u.EmailAddress === username);
        if (!user) {
         // this.toastr.error('Email not found. Please register.');
          alert('Email not found. Please register.');
          return;
        }

        if (user.Password === password) {
         // this.toastr.success('Login Successful!');
          this.loginForm.reset();
           // Navigate to the home page
           this.router.navigate(['/home']);
        } else {
          //this.toastr.error('Incorrect password. Please try again.');
        }
      }
    } catch (error) {
      console.error('Login Error:', error);
      //this.toastr.error('An error occurred while logging in. Please try again later.');
      alert('An error occurred while logging in. Please try again later.');
    }
  }

  async ResetPassword() {
    if (this.forgotPasswordForm.invalid) {
      this.toastr.error('Please fill in all required fields.');
      return;
    }

    try {
      const { email, newPassword } = this.forgotPasswordForm.value;
      const users = await this.signupService.getUsers().toPromise();

      if (users) {
        const user = users.find(u => u.EmailAddress === email);
        if (!user) {
          this.toastr.error(`Email ${email} not found.`);
          return;
        }
        if (user) {
          user.Password = newPassword;
         // await this.signupService.updateUser(user.Id, user).toPromise();
          this.toastr.success('Password updated successfully!');
          this.forgotPasswordForm.reset();
        }
      }
    } catch (error) {
      console.error('Password Reset Error:', error);
      this.toastr.error('An error occurred while resetting the password.');
    }
  }

  async RegisterNew() {
    if (this.userForm.invalid) {
      this.toastr.error('Please fill in all required fields.');
      return;
    }

    try {
      const newUser: Signup = this.userForm.value;
      const response = await this.signupService.createUser(newUser).toPromise();
      this.toastr.success('User registered successfully!');
      this.userForm.reset();
      this.onSigninClick();
    } catch (error) {
      console.error('Registration Error:', error);
      this.toastr.error('Failed to register user.');
    }
  }

  passwordMatchValidator(form: FormGroup) {
    return form.get('Password')?.value === form.get('ConfirmPassword')?.value
      ? null
      : { mismatch: true };
  }

  passwordValidator(): Validators {
    return Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/);
  }
  toggleForgotPassword() {
    this.forgotPasswordMode = !this.forgotPasswordMode;
  }

  getErrorMessage(controlName: string): string | null {
    try {
      const control = this.userForm.get(controlName);
      if (control?.hasError('required')) return `${controlName} is required.`;
      if (control?.hasError('pattern')) {
        switch (controlName) {
          case 'UserName':
            return 'Username cannot contain special characters.';
          case 'Password':
            return 'Password must meet the required criteria.';
          case 'PhoneNumber':
            return 'Phone number must be 10 digits.';
          default:
            return null;
        }
      }
      if (controlName === 'ConfirmPassword' && this.userForm.hasError('mismatch')) {
        return 'Passwords do not match.';
      }
      return null;
    } catch (er) {
      console.error(er);
      return null;
    }
  }


  onSignupClick() {
    try {
      // Move the pink box
      this.renderer.setStyle(this.pinkbox.nativeElement, 'transform', 'translateX(80%)');

      // Hide signin and show signup form
      this.renderer.addClass(this.signinForm.nativeElement, 'nodisplay');
      this.renderer.removeClass(this.signupForm.nativeElement, 'nodisplay');
    } catch (er) {
      console.error(er);
    }
  }

  onSigninClick() {
    try {
      // Move the pink box back
      this.renderer.setStyle(this.pinkbox.nativeElement, 'transform', 'translateX(0%)');

      // Hide signup and show signin form
      this.renderer.addClass(this.signupForm.nativeElement, 'nodisplay');
      this.renderer.removeClass(this.signinForm.nativeElement, 'nodisplay');
    } catch (er) {
      console.error(er);
    }
  }
}
