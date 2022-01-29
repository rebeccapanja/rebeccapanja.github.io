/** @jsx jsx */
import * as React from "react";
import { Global } from "@emotion/react";
import { Box, Container, jsx } from "theme-ui";
import Seo from "@lekoarts/gatsby-theme-minimal-blog/src/components/seo";
import useMinimalBlogConfig from "@lekoarts/gatsby-theme-minimal-blog/src/hooks/use-minimal-blog-config";
import Header from "./header";
import Footer from "@lekoarts/gatsby-theme-minimal-blog/src/components/footer";
import CodeStyles from "@lekoarts/gatsby-theme-minimal-blog/src/styles/code";
import useSiteMetadata from "@lekoarts/gatsby-theme-minimal-blog/src/hooks/use-site-metadata";
import Navigation from "@lekoarts/gatsby-theme-minimal-blog/src/components/navigation";
import HeaderExternalLinks from "@lekoarts/gatsby-theme-minimal-blog/src/components/header-external-links";
import { visuallyHidden } from "@lekoarts/gatsby-theme-minimal-blog/src/styles/utils";
import SkipNavLink from "@lekoarts/gatsby-theme-minimal-blog/src/components/skip-nav";
import { heroContainer } from "./heroLayout.module.css";

// @ts-ignore
import Hero from "../texts/hero";

type LayoutProps = { children: React.ReactNode; className?: string };

const Layout = ({ children, className = `` }: LayoutProps) => {
  const { navigation: nav } = useMinimalBlogConfig();
  const { siteTitle } = useSiteMetadata();

  return (
    <React.Fragment>
      <Global
        styles={(theme) => ({
          "*": {
            boxSizing: `inherit`,
          },
          html: {
            WebkitTextSizeAdjust: `100%`,
          },
          img: {
            borderStyle: `none`,
          },
          pre: {
            fontFamily: `monospace`,
            fontSize: `1em`,
          },
          "[hidden]": {
            display: `none`,
          },
          "::selection": {
            backgroundColor: theme.colors.text,
            color: theme.colors.background,
          },
          a: {
            transition: `all 0.3s ease-in-out`,
            color: `text`,
          },
        })}
      />
      <Seo />
      <SkipNavLink>Skip to content</SkipNavLink>

      <section
        sx={
          {
            // backgroundColor: "#e8fdf5",
          }
        }
      >
        <Container>
          <Header />

          <h1 sx={visuallyHidden}>{siteTitle}</h1>
          <div className={heroContainer}>
            <Hero />
            <div
              sx={{
                boxSizing: `border-box`,
                mb: "50px",
                display: `flex`,
                justifyContent: `flex-start`,
                color: `secondary`,
                a: { color: `secondary`, ":hover": { color: `heading` } },
                flexFlow: `wrap`,
              }}
            >
              <HeaderExternalLinks />
              {/* <Navigation nav={nav} /> */}
            </div>
          </div>
        </Container>
      </section>

      <Box id="skip-nav" sx={{ ...CodeStyles }} className={className}>
        {children}
      </Box>

      <Container className={heroContainer}>
        <Footer />
      </Container>
    </React.Fragment>
  );
};

export default Layout;
