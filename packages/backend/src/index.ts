import 'dotenv/config';

import { app } from './app';
import { env } from './lib/env.vars.ts';

app.listen(env.PORT, () => {
    console.log(`Server running on http://localhost:${env.PORT}`);
});
