import { useEffect, useState } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import { getUserWithUserID } from "../services/auth.service";
import default_avatar from '../assets/default.png';
import { createContact } from "../services/contact.service";
import { saveAs } from 'file-saver';
import AddMe from "../components/links/addme";
import GroupListDocker from "../components/contacts/grouplistdocker";
import { addMember } from "../services/group.service";
import { useDispatch, useSelector } from "react-redux";
import { setGroups } from "../features/groupSlice";
import { displayVideo, closeVideo, displayPdf, closePdf, displayImage, closeImage } from "../features/mediaSlice";
import Loading from "../components/common/Loading";
import { toast } from "react-toastify";
import { CiExport } from 'react-icons/ci';
import DEFAULT_USER_AVATAR from '../assets/default.png';
import Button from "../components/common/button";
import VideoPlayer from "../components/video-player/videoplayer";
import PDFViewer from "../components/pdfviewer/pdfviewer";
import ImageViewer from "../components/imageviewer/imageviewer";
import { PopupButton } from "react-calendly";
const Overview = () => {
    let params = useParams();
    let userid = params.userid;
    const groups = useSelector(state => state.group.groups);
    const [sGroups, setSGroups] = useState([...groups]);
    const [isPageLoaded, setIsPageLoaded] = useState(false);
    const [isProfileExist, setIsProfileExist] = useState(false);

    const [videoShow, setVideoShow] = useState(false);
    const [videoUrl, setVideoUrl] = useState("");

    const dispatch = useDispatch();
    useEffect(() => {
        setSGroups([...groups]);
    }, [groups]);
    const [sidebarOpened, setSidebarOpened] = useState(false);

    const [overviewUser, setOverviewUser] = useState({
        user: {},
        profile: {},
        links: [],
        calendly: {},
        card: {},
        theme: {},
    });

    const [sortedLinks, setSortedLinks] = useState([...overviewUser.links].sort((a, b) => b.order - a.order));
    useEffect(() => {
        setSortedLinks([...overviewUser.links] ? [...overviewUser.links].sort((a, b) => b.order - a.order) : []);
    }, [overviewUser.links])

    const downloadContactCard = (card) => {
        console.log(process.env.REACT_APP_SERVER_PUBLIC + '/' + card.content);
        saveAs(process.env.REACT_APP_SERVER_PUBLIC + '/' + card.content, overviewUser.user.username + '.' + card.content.split('.')[1]);
    }

    const handleClick = () => {
        setSidebarOpened(true);
    }

    const handleToggleSidebar = () => {
        setSidebarOpened(!sidebarOpened);
    }

    const handleAddContact = async (group) => {
        const res = await addMember({ group, user: overviewUser.user });
        if (res.success) {
            if (res.flag === false) {
                toast.info("Already saved in this group.")
            } else {
                dispatch(setGroups(res.groups));
                toast.success("Successfully Added");
                setSidebarOpened(false);
            }
        }
    }

    useEffect(() => {
        (async () => {
            const res = await getUserWithUserID(userid);
            if (res.success && !res.error) {
                setIsPageLoaded(true);
                setIsProfileExist(true);
                setOverviewUser(res);
                console.log('res', res);
            } else if (res.error.type) {
                setIsPageLoaded(true);
                setIsProfileExist(false);
            }
        })();
    }, [])

    const videoPlay = (source) => {
        console.log(source);
        dispatch(closePdf());
        dispatch(closeImage());
        dispatch(displayVideo(source));
    }

    const pdfPlay = (key) => {
        console.log(key);
        dispatch(closeVideo());
        dispatch(closeImage());
        dispatch(displayPdf(key))
    }

    const imagePlay = (source) => {
        console.log('fsd', source);
        dispatch(closeVideo());
        dispatch(closePdf());
        dispatch(displayImage(source))
    }
    const renderSwitch = (link) => {
        switch (link.type) {
            case 'link':
                return <div
                    key={link._id}
                    className={
                        `shadow-2xl ${overviewUser.theme.radius} border-2 bg-white text-xs py-3 text-center relative my-3 w-full relative`}
                    style={{ color: overviewUser.theme.textColor, backgroundColor: overviewUser.theme.textBg, borderColor: overviewUser.theme.linkBorderColor }}
                >
                    <a href={link.content} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none', color: 'inherit' }}>
                        {link.title}
                        {
                            link.type === 'link' && link.thumbnail && <img src={link.thumbnail} alt={`link thumbnail - ${link._id}`} className='w-7 h-7 rounded-full absolute left-2 top-1/2 translate-y-[-50%]' />
                        }
                    </a>
                </div>
            case 'image':
                return <div
                    onClick={() => imagePlay(link.content)}
                    key={link._id}
                    className={
                        `shadow-2xl ${overviewUser.theme.radius} border-2 bg-white text-xs py-3 text-center relative my-3 w-full relative`}
                    style={{ color: overviewUser.theme.textColor, backgroundColor: overviewUser.theme.textBg, borderColor: overviewUser.theme.linkBorderColor }}
                >
                    <img src={link.content} className='absolute left-[3px] top-[8.33%] h-5/6 aspect-square' />
                    {link.title}
                    {
                        link.type === 'link' && link.thumbnail && <img src={link.thumbnail} alt={`link thumbnail - ${link._id}`} className='w-7 h-7 rounded-full absolute left-2 top-1/2 translate-y-[-50%]' />
                    }
                </div>
            case 'application':
                return <div
                    onClick={() => pdfPlay(link.key)}
                    key={link._id}
                    className={
                        `shadow-2xl ${overviewUser.theme.radius} border-2 bg-white text-xs py-3 text-center relative my-3 w-full relative`}
                    style={{ color: overviewUser.theme.textColor, backgroundColor: overviewUser.theme.textBg, borderColor: overviewUser.theme.linkBorderColor }}
                >
                    {/* <img src={ link.content } className='absolute left-[3px] top-[8.33%] h-5/6 aspect-square' /> */}
                    {link.title}
                    {
                        link.type === 'link' && link.thumbnail && <img src={link.thumbnail} alt={`link thumbnail - ${link._id}`} className='w-7 h-7 rounded-full absolute left-2 top-1/2 translate-y-[-50%]' />
                    }
                </div>
            case 'video':
                return <div
                    onClick={() => videoPlay(link.content)}
                    key={link._id}
                    className={
                        `shadow-2xl ${overviewUser.theme.radius} border-2 bg-white text-xs py-3 text-center relative my-3 w-full relative`}
                    style={{ color: overviewUser.theme.textColor, backgroundColor: overviewUser.theme.textBg, borderColor: overviewUser.theme.linkBorderColor }}
                >
                    {/* <img src={ link.content } className='absolute left-[3px] top-[8.33%] h-5/6 aspect-square' /> */}
                    {link.title}
                    {
                        link.type === 'link' && link.thumbnail && <img src={link.thumbnail} alt={`link thumbnail - ${link._id}`} className='w-7 h-7 rounded-full absolute left-2 top-1/2 translate-y-[-50%]' />
                    }
                </div>
        }
    }

    return (

        <>
            {
                !isPageLoaded && <Loading text='Loading...'></Loading>
            }
            {
                isPageLoaded && !isProfileExist &&
                <div className="flex items-center justify-center flex-col gap-3">
                    <span className="text-xl">No profile found with this Link</span>
                    <Button variant="filled" to="/">Go Homepage</Button>
                </div>
            }
            {
                isProfileExist && isPageLoaded &&
                <>
                    <div className=' lg:w-4/6 w-full h-full mx-auto top-0 left-0 right-0'>
                        <div className='m-auto p-4 origin-top-left flex flex-col items-stretch bg-yellow-400 overflow-y-auto'
                            style={{ backgroundColor: overviewUser.theme.profileBg }}>
                            <div className={`mt-5 flex flex-col items-center justify-center bg-[#443608] py-7 rounded-3xl w-full relative ${overviewUser.theme.profileHeaderRadius}`}
                                style={{ backgroundColor: overviewUser.theme.profileHeaderBg }}>
                                <img src={`${(overviewUser.profile && overviewUser.profile.avatar) ? overviewUser.profile.avatar : default_avatar}`} alt="" className={`w-20 h-20 ${overviewUser.theme.avatarRadius}`} />
                                {
                                    overviewUser.user && overviewUser.user.username &&
                                    <p id='username'
                                        className='mt-3 text-md font-semibold text-center text-white'
                                        style={{ color: overviewUser.theme.textColor }}>
                                        @{overviewUser.user.username || ""}
                                    </p>
                                }
                                {
                                    overviewUser.profile && overviewUser.profile.title &&
                                    <p id='title'
                                        className='mt-3 text-base text-white text-center'
                                        style={{ color: overviewUser.theme.textColor }}>
                                        {overviewUser.profile.title}
                                    </p>
                                }
                                {
                                    overviewUser.profile && overviewUser.profile.bio &&
                                    <p id='bio'
                                        className='mt-2 text-base text-white text-center'
                                        style={{ color: overviewUser.theme.textColor }}>
                                        {overviewUser.profile.bio}
                                    </p>
                                }
                            </div>
                            <div className='w-full my-3'>
                                {
                                    <div className="flex flex-col md:flex-row w-full gap-3">
                                        {/* {
                                            isPageLoaded && overviewUser.calendly &&
                                            <a className="w-full" target="_blank" href={`${process.env.REACT_APP_ROOT_URL + '/visit/' + encodeURIComponent(JSON.stringify({ id: overviewUser.calendly._id, content: overviewUser.calendly.content, usename:overviewUser.user.username }))}`}>
                                                <div className="shadow-2xl rounded-full bg-white text-md py-3 text-center relative"
                                                    style={{ color: overviewUser.theme.textColor, backgroundColor: overviewUser.theme.textBg }}>
                                                    Schedule a meeting
                                                </div>
                                            </a>
                                        } */}
                                        {
                                            <div style={{ color: overviewUser.theme.textColor, backgroundColor: overviewUser.theme.textBg, borderColor: overviewUser.theme.linkBorderColor }}
                                                className={
                                                    `shadow-2xl ${overviewUser.theme.radius} border-2 bg-white text-xs text-center relative my-3 w-full relative`}>
                                                <PopupButton url={overviewUser.calendly.content}
                                                    className="w-full my-3"
                                                    rootElement={document.getElementById('root')}
                                                    text="click me to schedule" />
                                            </div>

                                        }
                                        {
                                            isPageLoaded && overviewUser.card && <a className="w-full"
                                                onClick={() => downloadContactCard(overviewUser.card)}>
                                                <div className="w-full shadow-2xl rounded-full bg-white text-xl py-3 text-center relative"
                                                    style={{ color: overviewUser.theme.textColor, backgroundColor: overviewUser.theme.textBg }}>
                                                    Download Contact Card
                                                </div>
                                            </a>
                                        }
                                    </div>
                                }

                                {(isPageLoaded && (overviewUser.card || overviewUser.calendly)) && <hr className="my-3" />}

                                {
                                    overviewUser.links && [...overviewUser.links].sort((a, b) => (b.order - a.order)).map((link, index) => {
                                        if (link.visible) {
                                            return (
                                                <>
                                                    {
                                                        renderSwitch(link)
                                                    }
                                                </>
                                            )
                                        } else {
                                            return null;
                                        }
                                    })
                                }
                                <AddMe handleClick={() => handleClick()} />
                                <VideoPlayer />
                                <PDFViewer />
                                <ImageViewer />
                            </div>

                        </div>

                        <GroupListDocker groups={sGroups} opened={sidebarOpened} toggleSidebar={() => handleToggleSidebar()} handleAddContact={handleAddContact} />
                    </div>


                </>
            }
        </>

    )
}

export default Overview;