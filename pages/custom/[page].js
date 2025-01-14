// npm
import ErrorPage from "next/error"
import Link from "next/link"
import MDXRuntime from "mdx-runtime-slim"
import { MDXProvider } from "@mdx-js/react"
import PropTypes from "prop-types"
import "isomorphic-unfetch"

// self
import Clock from "../../components/clock"

const a = ({ href, children }) =>
  href.indexOf("://") === -1 ? (
    <Link as={href} href="/custom/[page]">
      <a>{children}</a>
    </Link>
  ) : (
    <a target="_blank" rel="noopener noreferrer" href={href}>
      <sup>⧉</sup>&nbsp;{children}
    </a>
  )

const components = { Clock, a }

const AnError = ({ statusCode, page }) => {
  if (statusCode !== 404) return <ErrorPage statusCode={statusCode} />
  return (
    <div>
      <code>{page}</code> doesn't exist.{" "}
      <Link href={`/custom/ed/${page}`}>
        <a>Create it?</a>
      </Link>
    </div>
  )
}

const CustomPage = ({ MDXContent, page, errorCode }) => {
  if (errorCode) return <AnError page={page} statusCode={errorCode} />

  return (
    <MDXProvider components={components}>
      <div>
        <p>
          Hello{" "}
          <Link href="/p2">
            <a>Earth</a>
          </Link>
        </p>
        <MDXRuntime>{MDXContent}</MDXRuntime>
        <p>
          <Link href={`/custom/ed/${page}`}>
            <a>Edit</a>
          </Link>
        </p>
      </div>
    </MDXProvider>
  )
}

CustomPage.propTypes = {
  MDXContent: PropTypes.string.isRequired,
  page: PropTypes.string.isRequired,
}

CustomPage.getInitialProps = async (o) => {
  const {
    req,
    res,
    query: { page },
  } = o
  // FIXME: guard against system pages: custom, ed, etc.
  const res2 = await fetch(`http://localhost:3000/${page}.mdx`)
  if (res2.ok) {
    const c = await res2.text()
    return { MDXContent: c, page }
  }

  if (res2.status === 404) {
    if (res) res.statusCode = 404
    return {
      errorCode: 404,
      MDXContent: "",
      page,
    }
  }
  if (res) res.statusCode = 500
  return {
    errorCode: 500,
    MDXContent: "",
    page,
  }
}

export default CustomPage
