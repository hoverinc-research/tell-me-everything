# Architecture

```
src/
├── platform/   # Shared building blocks. Owned by the Mobile Platform team.
│   ├── camera/     # CameraScreen used by every capture flow
│   ├── network/    # Connectivity helpers
│   ├── upload/     # Photo upload client and queue hook
│   └── utils/
└── features/   # Product features. Owned by the feature teams.
    └── inspections/  # Damage inspections (Claims team)
```

## Rules

- `platform/` must never import from `features/`. Platform code is used by
  several teams (inspections, roofing measurements, homeowner capture), so it
  can't know about any one of them.
- When a feature needs different behavior from a platform module, the platform
  module exposes an option or callback and the feature passes its own value.
- Changes to `platform/` need a review from the Mobile Platform team.
