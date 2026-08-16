# MILEYM3DIA AI Resource Engine

The AI Resource Engine is designed to continuously expand and maintain
the MILEYM3DIA Creator Hub.

## Safety model

AI should not directly publish unreviewed resources.

The intended pipeline is:

1. Discover
2. Research
3. Structure
4. Validate
5. Create proposal
6. Create GitHub Pull Request
7. Human review
8. Merge
9. Deploy

## Discovery priorities

The initial priorities are:

- Music production
- Plugins
- Samples
- AI creator tools
- Video
- Graphic design
- Creator business

## Resource rules

AI must:

- Prefer official websites.
- Never invent URLs.
- Avoid duplicate resources.
- Distinguish free, freemium and paid resources.
- Preserve the source of information.
- Avoid claiming verification without evidence.
- Follow the JSON resource schema.

## Future integrations

The discovery workflow is provider-neutral so an AI API can be
connected later through GitHub Actions Secrets.

The eventual system will create pull requests containing proposed
resource records rather than silently modifying the live database.
