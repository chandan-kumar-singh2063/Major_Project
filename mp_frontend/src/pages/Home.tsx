import ChatbotSection from '@/components/ChatBotSection'
import Footer from '@/components/Footer'
import HomeContent from '@/components/HomeContent'
import Navbar from '@/components/Navbar'
import Slider from '@/components/Slider'

const Home = () => {
  return (
    <>
    <Navbar/>
    <Slider/>
    
    <HomeContent/>
    <ChatbotSection/>
    <Footer/>
    </>
    
  )
}

export default Home