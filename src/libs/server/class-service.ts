import { DataService } from './data-service';

class ClassService extends DataService<'classes'> {
  constructor() {
    super('classes');
  }
}

export const classService = new ClassService();
