import { DataService } from './data-service';
import { db, schema } from './db';
import { eq } from 'drizzle-orm';

export class StudentService extends DataService<'studentDirectory'> {
  constructor() {
    super('studentDirectory');
  }

  // Add specific business logic for students if needed
  public async getByClass(className: string) {
    return this.findMany({
      where: eq(schema.studentDirectory.className, className),
    });
  }
}

export const studentService = new StudentService();
