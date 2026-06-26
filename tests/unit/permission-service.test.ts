import { describe, expect, it } from 'vitest';
import { PermissionError, permissionErrorResponse } from '../../src/libs/server/permission-service';

describe('Permission service errors', () => {
  it('serializes permission errors as structured 403 responses', async () => {
    const response = permissionErrorResponse(
      new PermissionError('PERMISSION_DENIED', 'Missing permission [crm.lead.view].'),
    );
    const body = await response.json();

    expect(response.status).toBe(403);
    expect(body).toEqual({
      status: 'error',
      code: 'PERMISSION_DENIED',
      error: 'Missing permission [crm.lead.view].',
    });
  });
});
