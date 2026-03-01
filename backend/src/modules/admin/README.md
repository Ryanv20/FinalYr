# Admin Module
Emergency Operations Center (EOC) Administration Console logic.

## Purpose
EOC-level oversight. Allows high-level control over other entities such as validating Institution applications (MDCN check stub), appointing Public Health Officials (PHO), maintaining dynamic Rapid Response Protocols, and forcefully overriding the AI.

## Architecture
- `admin.repository.ts`: Interacts directly with database layers like `facilities`, `profiles`, `response_protocols`, and `ai_alerts`. Can execute admin-level database logic.
- `admin.service.ts`: Business logic checks and acts as the gatekeeper ensuring commands make sense before committing changes. Updates Supabase Auth User Metadata when needed.
- `admin.controller.ts`: Wraps the module features into HTTP Endpoints accessible strictly to users with the 'eoc' role configuration.
- `index.ts`: Combines internal parts and maps endpoints to the main API routing tree.
- `__tests__/admin.test.ts`: Robust tests mocking the highest consequence operations (auth updates, overrides) assuring that failure states are effectively bubbled up to the client.
