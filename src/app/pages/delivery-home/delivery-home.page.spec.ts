import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { DeliveryHomePage } from './delivery-home.page';

describe('DeliveryHomePage', () => {
  let component: DeliveryHomePage;
  let fixture: ComponentFixture<DeliveryHomePage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DeliveryHomePage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(DeliveryHomePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
