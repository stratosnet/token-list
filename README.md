# Stratos Token Lists (beta)

Official supported token list on Stratos network. NOTE: Currently all address not stable and in testing mode

## Contributing

To add a token to token-lists:

1. Install dependencies via `yarn install`. Note: you must be on Node.js 14.x or later to do this.
2. Add your token's logo to `assets/`
3. Add your token to `src/<network>.token-list.json`, where `<network>` is the name of the network your token is deployed to.
4. Run `yarn build` to regenerate the main token list.
5. Submit a pull request.

## License

MIT
