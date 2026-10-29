/**
 * Returns the normalized `href` when `url` is an HTTP or HTTPS URL, `false` otherwise.
 * It checks the scheme only.
 */
declare function isUrlHttp(url: string): string | false

export = isUrlHttp
