/** @jsx jsx */

import { jsx, Container } from "theme-ui";
import { Link } from "gatsby";
import HeroLayout from "./heroLayout";
import Title from "@lekoarts/gatsby-theme-minimal-blog/src/components/title";
import Listing from "@lekoarts/gatsby-theme-minimal-blog/src/components/listing";
import List from "@lekoarts/gatsby-theme-minimal-blog/src/components/list";
import useMinimalBlogConfig from "@lekoarts/gatsby-theme-minimal-blog/src/hooks/use-minimal-blog-config";
import useSiteMetadata from "@lekoarts/gatsby-theme-minimal-blog/src/hooks/use-site-metadata";
import replaceSlashes from "@lekoarts/gatsby-theme-minimal-blog/src/utils/replaceSlashes";
import { visuallyHidden } from "@lekoarts/gatsby-theme-minimal-blog/src/styles/utils";
// @ts-ignore
import Hero from "../texts/hero";
// @ts-ignore
import Bottom from "../texts/bottom";
import { heroContainer } from "./heroLayout.module.css";

type PostsProps = {
  posts: {
    slug: string;
    title: string;
    date: string;
    excerpt: string;
    description: string;
    timeToRead?: number;
    tags?: {
      name: string;
      slug: string;
    }[];
  }[];
  [key: string]: any;
};

const Homepage = ({ posts }: PostsProps) => {
  const { basePath, blogPath } = useMinimalBlogConfig();
  const { siteTitle } = useSiteMetadata();

  return (
    <HeroLayout>
      <h1 sx={visuallyHidden}>{siteTitle}</h1>
      <section
        sx={{
          paddingBottom: "100px",
          p: { fontSize: [1, 2, 3] },
          variant: `section_hero`,
        }}
      >
        <div className={heroContainer}>
          <Hero />
        </div>
      </section>
      {/* Make a common css style for this */}
      <section
        sx={{
          mb: 0,
          pt: [5],
          p: { fontSize: [1, 2, 3] },
          variant: `section_hero`,
          // backgroundColor: `accentPrimary`,
        }}
      >
        <div className={heroContainer}>
          <Title text="Latest Posts">
            <Link to={replaceSlashes(`/${basePath}/${blogPath}`)}>
              Read all posts
            </Link>
          </Title>
          <Listing posts={posts} showTags={false} />
        </div>
      </section>
      <section
        sx={{
          mb: 0,
          pt: [5],
          p: { fontSize: [1, 2, 3] },
          variant: `section_hero`,
          // backgroundColor: `accentSecondary`,
        }}
      >
        <div className={heroContainer}>
          <List>
            <Bottom />
          </List>
        </div>
      </section>
    </HeroLayout>
  );
};

export default Homepage;
