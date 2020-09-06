import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { PickupmodalPage } from './pickupmodal.page';

describe('PickupmodalPage', () => {
  let component: PickupmodalPage;
  let fixture: ComponentFixture<PickupmodalPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PickupmodalPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(PickupmodalPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
