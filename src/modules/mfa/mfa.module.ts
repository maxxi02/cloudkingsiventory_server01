import { MfaController } from './mfa.controller';
import { MfaService } from './mfa.service';
//export both service and Controller
const mfaService = new MfaService();
const mfaController = new MfaController(mfaService);

export { mfaService, mfaController };
