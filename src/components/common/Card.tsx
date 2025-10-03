import { ReactNode } from "react";
import { Avatar, Box, Divider, Typography, useTheme } from "@mui/material";
import { teal } from "../../theme/themePrimitives";

interface CardProps {
  title?: string;
  subtitle?: string;
  icon?: ReactNode;
  children: ReactNode;
}

const CustomCard = ({ title, subtitle, icon, children }: CardProps) => {
  const theme = useTheme();

  return (
    <Box padding="0.5rem">
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        gap="1rem"
        mb={2}
      >
        <Box>
          <Typography
            variant="overline"
            component="h3"
            fontWeight="600"
            lineHeight="1"
            color={theme.palette.text.secondary}
            letterSpacing={1}
          >
            {title}
          </Typography>
          <Typography variant="h4" component="h3" fontWeight="700" color={theme.palette.text.primary}>
            {subtitle}
          </Typography>
        </Box>
        {icon && (
          <Avatar
            sx={{
              bgcolor: teal,
              padding: "0.75rem",
              width: 60,
              height: 60,
            }}
          >
            {icon}
          </Avatar>
        )}
      </Box>

      <Divider sx={{ marginBottom: "2rem" }} />

      {children}
    </Box>
  );
};

export default CustomCard;
