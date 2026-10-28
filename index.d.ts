/**
 * Returns the normalized `href` when `url` is an HTTP or HTTPS URL without credentials whose host
 * is an IP literal, `localhost`, or a domain under a public TLD, `false` otherwise.
 */
declare function isUrlHttp(url: string): string | false

export = isUrlHttp
