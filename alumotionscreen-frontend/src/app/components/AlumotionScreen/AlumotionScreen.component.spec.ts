import {ComponentFixture, TestBed} from '@angular/core/testing';
import {AlumotionscreenComponent} from "./AlumotionScreen.component";
import {TranslateLoader, TranslateModule} from "@ngx-translate/core";
import {Observable, of} from "rxjs";

describe('AlumotionscreenComponent', () => {
  let fixture: ComponentFixture<AlumotionscreenComponent>;
  let component: AlumotionscreenComponent;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [AlumotionscreenComponent],
      imports: [TranslateModule.forRoot({
        loader: {
          provide: TranslateLoader, useValue: {
            getTranslation(): Observable<Record<string, string>> {
              return of({});
            }
          }
        }
      })],
    }).compileComponents();

    fixture = TestBed.createComponent(AlumotionscreenComponent);
    component = fixture.componentInstance;
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });
});
