import { Component, ElementRef, Renderer2, ViewChild } from '@angular/core';
import { LoginService } from '../../../Services/LogIn/login.service';
import { Signup } from '../../../Models/signup';
import { AbstractControl, FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { HttpClientModule , HttpClient} from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { catchError, debounceTime, Observable, of, switchMap } from 'rxjs';
import { ToastrModule, ToastrService } from 'ngx-toastr';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { LoginModule } from '../../../Modules/login/login.module';


@Component({
  selector: 'app-login',
  standalone: true,
  imports: [LoginModule,FormsModule, ReactiveFormsModule,CommonModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {
  private signupService: any
  //private toastr: ToastrService
  constructor(private renderer: Renderer2, 
    private http: HttpClient, private fb: FormBuilder,) {

    this.signupService = new LoginService(this.http);
  }
  user: Signup = new Signup();
  userForm!: FormGroup;
  loginForm!: FormGroup;
  forgotPasswordForm!: FormGroup;
  forgotPasswordMode = false;
  @ViewChild('pinkbox', { static: false }) pinkbox!: ElementRef;
  @ViewChild('signin', { static: false }) signinForm!: ElementRef;
  @ViewChild('signup', { static: false }) signupForm!: ElementRef;
  
  ngOnInit(): void {
    this.userForm = this.fb.group({
      UserName: ['', [Validators.required, Validators.pattern('^[a-zA-Z0-9 ]*$')]], // No special characters
      EmailAddress: ['', [Validators.required, Validators.email]],
      PhoneNumber: ['', [Validators.required, Validators.pattern('^[0-9]{10}$')]], // 10 digit number
      Password: ['', [Validators.required, this.passwordValidator()]], 
      ConfirmPassword: ['', [Validators.required, this.passwordValidator()]]
    }, { validators: this.passwordMatchValidator });
    this.loginForm = this.fb.group({
      username: ['', [Validators.required, Validators.email]], 
      password: ['', [Validators.required, this.passwordValidator()]],
      remember: [false] 
    });

    this.forgotPasswordForm = this.fb.group(
      {
        email: ['', [Validators.required, Validators.email]],//,[this.emailExistsValidator.bind(this)] for async verification
        newPassword: ['', [Validators.required, this.passwordValidator()]],
        confirmPassword: ['', Validators.required]
      },
      { validators: this.passwordMatchValidator }
    );
  }

  Login() {
    
    //console.log('Login Data:', this.loginForm.value);
    if (this.loginForm.valid) {
      const { username, password } = this.loginForm.value;

      this.signupService.getUsers().subscribe((users: any[]) => {
        const user = users.find(u => u.EmailAddress === username);
        
        if (user) {
        console.log('Login Data:', user);

          // If the user is found, check if the password matches
          if (user.Password === password) {
            this.loginForm.reset();
            //this.toastr.success('Login Successful!', 'Success');
            // Here you can redirect the user to the dashboard or other page
          } else {
           //this.toastr.error('Incorrect password. Please try again.');
          }
        } else {
          //this.toastr.error('Email not found. Please register or check your email.');
        }
      }, (error: any) => {
        //this.toastr.error('An error occurred while checking credentials. Please try again later.');
      });
    } else {
      //this.toastr.error('Please fill in all required fields.');
    }
  }

  
  ResetPassword() {
    if (this.forgotPasswordForm.valid) {
      const { email, newPassword } = this.forgotPasswordForm.value;
      let user:Signup | any;
      this.signupService.getUsers().subscribe((users: any[]) => {
         user = users.find(u => u.EmailAddress === email);
      })
      if (user) {
        user.Password = newPassword;
        this.signupService.updateUser(user.Id, user).subscribe((res: any) => {
          //this.toastr.success(`updated password of ${user.Email}`)
          alert("success");
          this.forgotPasswordForm.reset()
       }, (er:any)=>{
        //this.toastr.error(`failed to update password of ${user.Email}`)
       })

      }else{
        //this.toastr.error(`${user.Email} not matched`)
      }
      
    }
  }
  RegisterNew() {
    if (this.userForm.valid) {
     
      this.user.UserName = this.userForm.value.UserName;
      this.user.EmailAddress = this.userForm.value.EmailAddress;
      this.user.PhoneNumber = this.userForm.value.PhoneNumber;
      this.user.Password = this.userForm.value.Password;
      
      console.log('Login Data:', this.user); // Log the user data
      // Call the service method to create a user
      this.signupService.createUser(this.user).subscribe({
        next: (response:any) => {
          console.log('User created successfully:', response);
          this.userForm.reset();
          this.onSigninClick();
          //this.toastr.success("User Registerd successfully")
        },
        error: (error:any) => {
          console.error('Error creating user:', error);
          //this.toastr.error("failed to Register user")
        }
      });
    } else {
      console.log('Form is invalid', this.userForm);
    }
  }

  getErrorMessage(controlName: string): string | null {
    const control = this.userForm.get(controlName);
    
    if (control?.hasError('required')) {
      return `${controlName} is required.`;
    } else if (control?.hasError('pattern')) {
      switch (controlName) {
        case 'UserName':
          return 'Username cannot contain special characters.';
        case 'Password':
          return 'Password must be at least 8 characters, include at least 1 uppercase letter, 1 lowercase letter, 1 number, and 1 special character.';
        case 'PhoneNumber':
          return 'Phone number must be 10 digits.';
        default:
          return null;
      }
    } else if (controlName === 'ConfirmPassword' && this.userForm.hasError('mismatch')) {
      return 'Passwords do not match.';
    }
    
    return null;
  }
  // Asynchronous email validator to check if the email exists in the database
  emailExistsValidator(control: AbstractControl): Observable<ValidationErrors | null> {
    return this.signupService.checkEmail(control.value).pipe(
      debounceTime(500), // Delay to prevent multiple requests
      switchMap(exists => exists ? of({ emailExists: true }) : of(null)),
      catchError(() => of(null))
    );
  }
  passwordMatchValidator(form: FormGroup) {
    return form.get('Password')?.value === form.get('ConfirmPassword')?.value ? null : { 'mismatch': true };
  }
  passwordValidator(): Validators {
    return Validators.pattern(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/
    );
  }
  toggleForgotPassword() {
    this.forgotPasswordMode = !this.forgotPasswordMode;
  }

  onSignupClick() {
    // Move the pink box
    this.renderer.setStyle(this.pinkbox.nativeElement, 'transform', 'translateX(80%)');
    
    // Hide signin and show signup form
    this.renderer.addClass(this.signinForm.nativeElement, 'nodisplay');
    this.renderer.removeClass(this.signupForm.nativeElement, 'nodisplay');
  }

  onSigninClick() {
    // Move the pink box back
    this.renderer.setStyle(this.pinkbox.nativeElement, 'transform', 'translateX(0%)');

    // Hide signup and show signin form
    this.renderer.addClass(this.signupForm.nativeElement, 'nodisplay');
    this.renderer.removeClass(this.signinForm.nativeElement, 'nodisplay');
  }
}
