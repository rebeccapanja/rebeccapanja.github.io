/** @jsx jsx */
import { jsx, useColorMode, Flex } from "theme-ui";
import ColorModeToggle from "@lekoarts/gatsby-theme-minimal-blog/src/components/colormode-toggle";

const Header = () => {
  const [colorMode, setColorMode] = useColorMode();
  const isDark = colorMode === `dark`;
  const toggleColorMode = (e: any) => {
    e.preventDefault();
    setColorMode(isDark ? `light` : `dark`);
  };

  return (
    <header>
      <Flex sx={{ alignItems: `center`, justifyContent: `flex-end` }}>
        <ColorModeToggle isDark={isDark} toggle={toggleColorMode} />
      </Flex>
    </header>
  );
};

export default Header;
