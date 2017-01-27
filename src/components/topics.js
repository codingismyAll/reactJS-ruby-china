import React, { Component, PropTypes } from 'react'
import '../assets/styles/topics.css'
import { connect } from 'react-redux'
import { fetchTopicsIfNeeded, invalidateTab } from '../actions'
import { Spin, Alert, Pagination } from 'antd';
import TopicItem from './topicItem.js';
import { browserHistory } from 'react-router'

class Topics extends Component {
  static propTypes = {
    pathname: PropTypes.string.isRequired,
    topics: PropTypes.array.isRequired,
    isFetching: PropTypes.bool.isRequired,
    lastUpdated: PropTypes.number,
    fetchTopicsIfNeeded: PropTypes.func.isRequired,
  }
  constructor(props) {
    super(props);
  
    this.state = {
      current: this.props.pathname,  
      isFetching: this.props.isFetching, 
      page: Number(this.props.page),
      node_id: Number(this.props.node_id),
    };
    this.handleChangePage = this.handleChangePage.bind(this);
  }
  handleChangePage(page){
    const { pathname,query, hash } = this.props
    if (hash.indexOf('#') > -1) {
      let hashGroup = hash;
      if (hash.indexOf('?') > -1) {
        if (hash.indexOf('page') > -1) {
          hashGroup = hashGroup.split('page=')[0] + 'page=' + page;
        }else{
          hashGroup += '&page='+page;
        }
        
      }else{
        hashGroup += '?page='+page;
      }

      browserHistory.push({
        hash: hashGroup,
      });
    }else{
      browserHistory.push({
        pathname: pathname,
        query: { ...query, page: page }
      });
    }

    
  }
  componentDidMount() {
    const { fetchTopicsIfNeeded, search, invalidateTab } = this.props
    invalidateTab(this.props.pathname);
    fetchTopicsIfNeeded(this.props.pathname, search);
  }
  componentWillReceiveProps(nextProps) {
    if (nextProps.pathname !== this.state.current || nextProps.isFetching !== this.state.isFetching || Number(nextProps.page) !== this.state.page || Number(nextProps.node_id) !== this.state.node_id ) {
      const { fetchTopicsIfNeeded, invalidateTab } = nextProps;
      this.setState({
        current: nextProps.pathname,
        isFetching: nextProps.isFetching, 
        page: Number(nextProps.page),   
        node_id: Number(nextProps.node_id),   
      })
      if (nextProps.pathname !== this.state.current || Number(nextProps.page) !== this.state.page || Number(nextProps.node_id) !== this.state.node_id) {
        invalidateTab(nextProps.pathname);
        fetchTopicsIfNeeded(nextProps.pathname, nextProps.search);
      }
    }
  }
  render() {
    const {topics, isFetching, error } = this.props
    const isEmpty = topics.length === 0;
    const errorMsg = error;
    const container = (
      isEmpty || errorMsg ? <Alert message="数据加载失败，真相只有一个！" description="请检查你的网络状态" type="warning" />
        : <div className="topics">
            {topics.map((topic, i) =>
              <TopicItem key={i} topic={topic} />
            )}
            <div className="topics-pagination"><Pagination onChange={this.handleChangePage} total={700} current={this.state.page} /></div>
          </div>
      
    );
    return (
      <Spin spinning={isFetching} tip="Loading...">{container}</Spin>
    );
  }
}
const mapStateToProps = (state, ownProps) => {
  let {pathname, search, query, hash} = state.routing.locationBeforeTransitions;
  let page = query.page || 1
  let node_id = query.node_id || 0
  if (hash.indexOf('#') > -1) {
    pathname = hash.slice(1).split('?')[0];
    page = hash.indexOf('page=') > -1 ? hash.split('page=')[1] : page
    node_id = hash.indexOf('node_id=') > -1 ? hash.split('node_id=')[1].split('&')[0] : node_id
    search = hash.indexOf('?') > -1 ? '?' + hash.split('?')[1] : ''
  }

  const {topicsByTab} = state
  const {
    isFetching,
    lastUpdated,
    items:topics,
    error
  } = topicsByTab[pathname] || {
    isFetching: true,
    items: []
  }

  return {
    pathname,
    hash,
    page,
    node_id,
    search,
    topics,
    isFetching,
    lastUpdated,
    error
  }
}

const mapDispatchToProps = (dispatch, props) => {
  return {
    fetchTopicsIfNeeded: (selectedTab, search) => dispatch(fetchTopicsIfNeeded(selectedTab, search)),
    invalidateTab: (selectedTab) => dispatch(invalidateTab(selectedTab)),
  }
}
export default connect(mapStateToProps, mapDispatchToProps)(Topics)