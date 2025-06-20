import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import Filters from '../components/Filters';
import ArticleList from '../components/ArticleList';
import Spinner from '../components/Spinner';
import NoArticles from '../components/NoArticles';
import CssBaseline from '@mui/material/CssBaseline';
import Box from '@mui/material/Box';
import Drawer from '@mui/material/Drawer';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import MenuIcon from '@mui/icons-material/Menu';
import { styled } from '@mui/material/styles';
import InfiniteScroll from 'react-infinite-scroll-component';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import CloseIcon from '@mui/icons-material/Close';

const drawerWidth = 300;
const PAGE_SIZE = 10;

const Main = styled('main', { shouldForwardProp: (prop) => prop !== 'open' })(
  ({ theme, open }) => ({
    flexGrow: 1,
    padding: theme.spacing(3),
    transition: theme.transitions.create('margin', {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),
    marginLeft: `-${drawerWidth}px`,
    ...(open && {
      transition: theme.transitions.create('margin', {
        easing: theme.transitions.easing.easeOut,
        duration: theme.transitions.duration.enteringScreen,
      }),
      marginLeft: 0,
    }),
  }),
);

const StyledAppBar = styled(AppBar, {
  shouldForwardProp: (prop) => prop !== 'open',
})(({ theme, open }) => ({
  transition: theme.transitions.create(['margin', 'width'], {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  ...(open && {
    width: `calc(100% - ${drawerWidth}px)`,
    marginLeft: `${drawerWidth}px`,
    transition: theme.transitions.create(['margin', 'width'], {
      easing: theme.transitions.easing.easeOut,
      duration: theme.transitions.duration.enteringScreen,
    }),
  }),
}));

const DrawerHeader = styled('div')(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  padding: theme.spacing(0, 1),
  ...theme.mixins.toolbar,
  justifyContent: 'flex-end',
}));

const HomePage = () => {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [filters, setFilters] = useState({});
  const [selectedArticle, setSelectedArticle] = useState(null);

  const handleDrawerToggle = () => {
    setOpen(!open);
  };

  const handleArticleClick = (article) => {
    setSelectedArticle(article);
  };

  const handleClose = () => {
    setSelectedArticle(null);
  };

  const fetchArticles = useCallback(async (newFilters, pageNum) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        limit: PAGE_SIZE,
        skip: (pageNum - 1) * PAGE_SIZE,
      });
      const currentFilters = newFilters || filters;
      for (const key in currentFilters) {
        if (currentFilters[key]) {
          params.append(key, currentFilters[key]);
        }
      }
      const response = await axios.get(`http://0.0.0.0:8000/v1/articles?${params.toString()}`);
      const newArticles = response.data.items;

      setArticles((prevArticles) => (pageNum === 1 ? newArticles : [...prevArticles, ...newArticles]));
      setHasMore(newArticles.length === PAGE_SIZE);
      setPage(pageNum + 1);
    } catch (error) {
      console.error('Error fetching articles:', error);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchArticles(filters, 1);
  }, [filters]);

  const handleSearch = (newFilters) => {
    setFilters(newFilters);
    setPage(1);
    setArticles([]);
  };

  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />
      <StyledAppBar position="fixed" open={open}>
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            onClick={handleDrawerToggle}
            edge="start"
            sx={{ mr: 2 }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" noWrap component="div">
            Wire Scout
          </Typography>
        </Toolbar>
      </StyledAppBar>
      <Drawer
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: drawerWidth,
            boxSizing: 'border-box',
          },
        }}
        variant="persistent"
        anchor="left"
        open={open}
      >
        <DrawerHeader />
        <Box sx={{ p: 2 }}>
          <Filters onSearch={handleSearch} />
        </Box>
      </Drawer>
      <Main open={open}>
        <DrawerHeader />
        <InfiniteScroll
          dataLength={articles.length}
          next={() => fetchArticles(filters, page)}
          hasMore={hasMore}
          loader={<Spinner />}
          endMessage={<NoArticles />}
        >
          <ArticleList articles={articles} onArticleClick={handleArticleClick} />
        </InfiniteScroll>
      </Main>
      {selectedArticle && (
        <Dialog open={!!selectedArticle} onClose={handleClose} fullWidth maxWidth="md">
          <DialogTitle>
            {selectedArticle.title}
            <IconButton
              aria-label="close"
              onClick={handleClose}
              sx={{
                position: 'absolute',
                right: 8,
                top: 8,
                color: (theme) => theme.palette.grey[500],
              }}
            >
              <CloseIcon />
            </IconButton>
          </DialogTitle>
          <DialogContent dividers>
            <Typography gutterBottom color="text.secondary">
              {selectedArticle.news_provided_by} - {new Date(selectedArticle.date).toLocaleString()}
            </Typography>
            <Typography sx={{ fontFamily: 'Georgia, serif', fontSize: '1.1rem', lineHeight: 1.6 }}>
              {selectedArticle.content}
            </Typography>
          </DialogContent>
        </Dialog>
      )}
    </Box>
  );
};

export default HomePage;
