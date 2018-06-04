# Stapsher

Stapsher is an API service for handling user-generated contents on static sites, built with Node.js.

Stapsher receives POST requests from your site's forms, validates the data and processes them. And finally it pushes the generated data file to your repository. Or if you have moderation enabled, it will create a pull request instead.

Your static site generator can then generate the those user-generated contents from the data files created by Stapsher.

In short, Stapsher helps you to keep all the contents of your site as static files in a git repository.

Stapsher currently works with:

- GitHub
- GitLab

BitBucket support is planned for future.

## Documentation

You can find the documentation for Stapsher at: [https://stapsher.netlify.com](https://stapsher.netlify.com)

## Development

If you find a bug or want to request a new feature, feel free to open an issue.

## Acknowledgement

Stapsher is inspired by [Staticman](https://github.com/eduardoboucas/staticman) (developed by [Eduardo Bouças](https://github.com/eduardoboucas)).

## License

Stapsher's source code is licensed under the MIT License. Check the [LICENSE](https://github.com/extraStatic/stapsher/blob/master/LICENSE) file for details.
