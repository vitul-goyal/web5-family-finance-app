import { Html, Head, Main, NextScript } from 'next/document'

export default function Document() {
	return (
		<Html lang="en">
			<meta charSet="UTF-8"></meta>
			<meta name="viewport" content="width=device-width, initial-scale=1.0"></meta>
			<link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/4.5.2/css/bootstrap.min.css"></link>
			<Head />
			<body>
				<Main />
				<NextScript />
			</body>
		</Html>
	)
}
