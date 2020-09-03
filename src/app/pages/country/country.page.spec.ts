import { async, ComponentFixture, TestBed } from "@angular/core/testing";
import { IonicModule } from "@ionic/angular";

import { CountryPage } from "./country.page";

describe("CountryPage", () => {
  let component: CountryPage;
  let fixture: ComponentFixture<CountryPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [CountryPage],
      imports: [IonicModule.forRoot()],
    }).compileComponents();

    fixture = TestBed.createComponent(CountryPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
