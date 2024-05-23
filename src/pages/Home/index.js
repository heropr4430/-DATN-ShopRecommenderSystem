import React from 'react';
import Footer from '../../components/Footer/Footer';
import RecommendTop from './recomendTop';
import Search from './search';
import Summary from './sumary';

import TimeLine from './timeline';
import Categories from './categories';
import LoginElement from './login';
import Our from './our';

const Home = () => {
    return (
        <div className="w-full bg-black">
            <Search />
            <Summary />
            <Categories />
            <RecommendTop />
            <TimeLine />
            <LoginElement />
            <Our />
        </div>
    );
};
export default Home;
